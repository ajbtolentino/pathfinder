import { Box } from '@mui/system';
import './App.css';
import Grid from './components/Grid/Grid';

const App = () => {
  return (
    <Box 
        height={"100vh"}
        display={"flex"}
        alignItems={"center"}
        flexDirection={"column"}
        justifyContent={"center"}
        flexGrow={1}
    >
      <Grid 
        rows={10} 
        columns={10} 
        nodeSize={20} />
    </Box>
  );
}

export default App;
