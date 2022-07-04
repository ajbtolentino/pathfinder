import { Box } from '@mui/system';
import './App.css';
import Grid from './components/Grid/Grid';

const App = () => {
  return (
    <Box height={"100vh"}
         display={"flex"}
         alignItems={"center"}
         flexDirection={"column"}
         justifyContent={"center"}
         flexGrow={1}
    >
      <Grid 
        rows={10} 
        columns={20} 
        nodeSize={30}
        delay={1} />
    </Box>
  );
}

export default App;
