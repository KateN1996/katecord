import { useTheme } from '@mui/material/styles';
import Button from "@mui/material/Button";
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import AppBar  from "@mui/material/AppBar";
import TagIcon from '@mui/icons-material/Tag'

interface ChannelHeaderProps{
    channelName: string;
    displayName: string;
    handleSignOut: () => void;
}

export function ChannelHeader({channelName, displayName, handleSignOut} : ChannelHeaderProps){
    const theme = useTheme();
    return(
        <AppBar
          position="static"
          elevation={0}
          sx={{ bgcolor: 'background.default', borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Toolbar>
            <TagIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary' }}>
              {channelName}
            </Typography>
            <Typography sx={{ mr: 2, color: 'text.secondary' }}>
              {displayName}
            </Typography>
            <Button onClick={handleSignOut} variant="outlined" size="small">
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>
    )
}