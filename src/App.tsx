import { Box } from '@mui/system';
import './App.css';
import PathfinderGrid from './components/PathfinderGrid/PathfinderGrid';

const App = () => {
  return (
    <Box 
      height={"100vh"}
      display={"flex"}
      alignItems={"center"}
      flexGrow={1}
    >
      <PathfinderGrid rows={10} columns={10} nodeSize={20} />
    </Box>
  );
}

export default App;
