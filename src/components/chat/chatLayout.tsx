import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Box from '@mui/material/Box';
import type { User } from '@supabase/supabase-js';
import { ServerList } from '../servers/serverList';
import type{ Server, Message, Channel } from '../../types/chat';
import { ChannelList } from '../channels/channelList';
import { ChannelHeader } from '../channels/channelHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './messageInput';
interface ChatLayoutProps {
  user: User;
}

export function ChatLayout({ user }: ChatLayoutProps) {
  const [servers, setServers] = useState<Server[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedServer, setSelectedServer] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messageCacheRef = useRef<Record<number, Message[]>>({});
  const subscriptionRef = useRef<any>(null);
  const initialLoadDoneRef = useRef(false);

  const displayName = user.user_metadata?.display_name || user.email;
  const currentChannel = channels.find(c => c.id === selectedChannel);
  const serverChannels = useMemo(() => channels.filter(c => c.server_id === selectedServer), [channels, selectedServer]);

  const loadServers = async () => {
    const {data } = await supabase
      .from('servers')
      .select('*')
      .order('created_at'); // lets just do it by time created at right now  and figure out personal ordering later
    
    if (!data || data.length === 0 ){
      return;
    }

    setServers(data);
    const firstServer = data[0];

    const lastServerId = Number(localStorage.getItem('lastServer'));

    const initialServer = data.find(s => s.id === lastServerId) ?? firstServer;
    setSelectedServer(initialServer.id);

    const { data: channelData } = await supabase
      .from('channels')
      .select('*')
      .eq('server_id', initialServer.id)
      .order('name');

    if (!channelData || channelData.length === 0) {
      initialLoadDoneRef.current = true;
      return;
    }

    setChannels(channelData);

    const lastChannelId = Number(localStorage.getItem('lastChannel'));
    const initialChannel = channelData.find(c => c.id === lastChannelId) ?? channelData[0];
    setSelectedChannel(initialChannel.id);

    initialLoadDoneRef.current = true;
  }

  useEffect(() => {
    loadServers();
  }, []);

  const loadChannels = useCallback(async (serverId: number) => {
    const {data} = await supabase
      .from('channels')
      .select('*') // need to load all servers <- change this later to just servers user is in
      .eq('server_id', serverId) // added index
      .order('name') // TODO: again personalize this shit

      if (data) {
        setChannels(data);
        setSelectedChannel(data[0]?.id ?? null);
      }
  },[]);

  useEffect(() => {
    if(!selectedServer){
      return;
    }

    localStorage.setItem('lastServer', String(selectedServer));

    if(!initialLoadDoneRef.current){ //load servers already handled this at this point
      return;
    }


    loadChannels(selectedServer);
    
  }, [selectedServer, loadChannels]);

  const fetchMessages = async (channelId: number) => {
    // if (messageCacheRef.current[channelId]){
    //   setMessages(messageCacheRef.current[channelId]);
    //   return;

    // }

    setLoadingMessages(true);
    setMessages([]);

    const { data, error } = await supabase
      .from('messages')
      //.select('*')
      .select('id, content, display_name, user_id, channel_id, created_at')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false }) // lol 
      // .limit(50); // TODO: implement scrolling

    if (error) {
      console.error('Error fetching messages:', error.message.toString());
    } else {
      // need to cache in here
      const msgs = (data || []).reverse();
      messageCacheRef.current[channelId] = msgs
      setMessages(msgs); 

    }

    setLoadingMessages(false);
  };

  useEffect(() => {
    if (!selectedChannel){
      return;
    }

    localStorage.setItem('lastChannel', String(selectedChannel));

    if (messageCacheRef.current[selectedChannel]){
      setMessages(messageCacheRef.current[selectedChannel]);
    }else{
      fetchMessages(selectedChannel);
    }
    

    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    const subscription = supabase
      .channel(`messages-channel-${selectedChannel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${selectedChannel}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => { // cache in here too
            if (prev.some(msg => msg.id === newMessage.id)) return prev;

            // Replace optimistic duplicate: same content, same user, within 5 seconds
            const optimisticIndex = prev.findIndex(
              msg => !msg.failed &&
                msg.display_name === newMessage.display_name &&
                msg.content === newMessage.content &&
                Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 5000
            );

            let updated: Message[];

            if (optimisticIndex !== -1) {
              updated = [...prev];
              updated[optimisticIndex] = newMessage;
            }else{
              updated = [...prev, newMessage];
            }

            // if (selectedChannel){
            //   messageCacheRef.current[selectedChannel] = updated;
            // }

            messageCacheRef.current[newMessage.channel_id] = updated;

            return updated;
          });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [selectedChannel]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChannel) return;

    const tempId = crypto.randomUUID();
    const newMessage: Message = {
      id: tempId,
      content: message.trim(),
      display_name: displayName as string,
      user_id: user.id,
      channel_id: selectedChannel,
      created_at: new Date().toISOString(),
      failed: false,
    };

    setMessages( prev => {
      const updated = [...prev, newMessage];
      messageCacheRef.current[selectedChannel] = updated;
      return updated;

    });
    setMessage('');

    const { error } = await supabase
      .from('messages')
      .insert({
        content: newMessage.content,
        user_id: user.id,
        display_name: displayName,
        channel_id: selectedChannel,
      });

    if (error) {
      console.error('Error sending message:', error.message.toString());
      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...m, failed: true } : m)
      );
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Server List */}
      <ServerList
        servers={servers}
        selectedServer={selectedServer}
        onSelectServer={setSelectedServer}
        onServersChange={loadServers}
      />

      {/* Channel List */}
      {selectedServer && servers.find(s => s.id === selectedServer) && (
        <ChannelList
          server={servers.find(s => s.id === selectedServer)!}
          channels={serverChannels}
          selectedChannel={selectedChannel!}
          onSelectChannel={setSelectedChannel}
          onChannelChange={() => loadChannels(selectedServer)}
        />
      )}     

      {/* Main Chat Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: 0,
          minWidth: 0,
        }}
      >
        {/* Top Bar */}
        <ChannelHeader
          channelName={currentChannel?.name || 'Select a channel'}
          displayName={displayName}
          handleSignOut={handleSignOut}
        />

        {/* Messages List */}
        <MessageList messages={messages} loading={loadingMessages}/>
       

        {/* Message Input */}
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <MessageInput 
          value={message}
          onChange={setMessage}
          onSend={handleSendMessage}
          placeholder={`Message #${currentChannel?.name || 'channel'}`}
          disabled={!selectedChannel}

          />
         
        </Box>
      </Box>
    </Box>
  );
}