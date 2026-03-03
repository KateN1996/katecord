import { useEffect, useState, useRef, useMemo } from 'react';
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

  const subscriptionRef = useRef<any>(null);

  const displayName = user.user_metadata?.display_name || user.email;
  const currentChannel = channels.find(c => c.id === selectedChannel);
  const serverChannels = channels.filter(c => c.server_id === selectedServer);

  const isServerOwner = useMemo(() => {
    if (!selectedServer || !servers.length) return false;
    const currentServer = servers.find(s => s.id === selectedServer);
    return currentServer?.owner_id === user.id;
  }, [selectedServer, servers, user.id]);

  const handleEditMessage = async (messageId: string, newMessage: string) => {
    try {
      console.log('inside edit')
      const { data, error } = await supabase
        .from('messages')
        .update({content: newMessage, updated_at: new Date().toISOString(), edited: true})
        .eq('id', messageId)
        .select();

      console.log('got messager data from server ', data)

      if (error) {
        console.error('Error updating message:', error.message);
        return;
      }

      // Update local state
       setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: newMessage, edited: true } 
            : msg
        )
      );
      
    } catch (error) {
      console.error('Error updating message:', error);
   }
  }

  const handleDeleteMessage = async (messageId: string) => {
  try {
    console.log('inside delete')
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)


    if (error) {
      console.error('Error deleting message:', error.message);
      return;
    }

    // Update local state
    setMessages(prev => prev.filter(m => m.id !== messageId));
  } catch (error) {
    console.error('Error deleting message:', error);
  }
};

  const loadServers = async () => {
    const {data } = await supabase
      .from('servers')
      .select('*')
      .order('created_at'); // lets just do it by time created at right now  and figure out personal ordering later
    
      if (data){
        setServers(data);
        setSelectedServer(data[0].id);
    
      }
  }

  useEffect(() => {
    loadServers();
  }, []);

  const loadChannels = async (serverId: number) => {
    console.log("Loading channels for server ID:", serverId);
    const {data} = await supabase
      .from('channels')
      .select('*') // need to load all servers <- change this later to just servers user is in
      .eq('server_id', serverId) // added index
      .order('name') // TODO: again personalize this shit

      if (data) {

        setChannels(data);
        console.log("data ", data)
        if (data.length >0){
          console.log("HERE")
          setSelectedChannel(data[0].id);
        }
      }
  };

  useEffect(() => {
    if (selectedServer) {
      loadChannels(selectedServer);
    }
  }, [selectedServer]);

  const fetchMessages = async (channelId: number) => {
    setLoadingMessages(true);
    setMessages([]);

    const { data, error } = await supabase
      .from('messages')
      //.select('*')
      .select('id, content, display_name, user_id, channel_id, created_at, edited')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false }) // lol 
      // .limit(50); // TODO: implement scrolling

    if (error) {
      console.error('Error fetching messages:', error.message.toString());
    } else {
      setMessages(data.reverse() || []); 
    }

    setLoadingMessages(false);
  };

  useEffect(() => {
    if (!selectedChannel){
      return;

    }
    fetchMessages(selectedChannel);

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
          setMessages(prev => {
            if (prev.some(msg => msg.id === newMessage.id)) return prev;

            // Replace optimistic duplicate: same content, same user, within 5 seconds
            const optimisticIndex = prev.findIndex(
              msg => !msg.failed &&
                msg.display_name === newMessage.display_name &&
                msg.content === newMessage.content &&
                Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 5000
            );

            if (optimisticIndex !== -1) {
              const updated = [...prev];
              updated[optimisticIndex] = newMessage;
              return updated;
            }

            return [...prev, newMessage];
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

    setMessages(prev => [...prev, newMessage]);
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
        <MessageList messages={messages} loading={loadingMessages} currentUserId={user.id} isServerOwner={isServerOwner} onDeleteMessage={handleDeleteMessage} onEditMessage={handleEditMessage}/>
       

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