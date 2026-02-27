import TextField from '@mui/material/TextField';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  disabled?: boolean;
}

export function MessageInput({ 
  value, 
  onChange, 
  onSend, 
  placeholder,
  disabled 
}: MessageInputProps) {
  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onSend();
        }
      }}
      disabled={disabled}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
      }}
    />
  );
}