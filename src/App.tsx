import { Checkbox, Drawer, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Box } from '@mui/system';
import './App.css';
import GridComponent, { GridAlgorithm } from './components/Grid/GridComponent';
import React from 'react';
import { NodeType } from './models/Node';
import { useGrid } from './hooks/useGrid';

const drawerWidth = 260;

const App = () => {
  const [algorithm, setAlgorithm] = React.useState<GridAlgorithm>("astar");
  const [rows, setRows] = React.useState<number>(21);
  const [columns, setColumns] = React.useState<number>(31);
  const [nodeSize, setNodeSize] = React.useState<number>(30);

  const { grid, create } = useGrid();

  const [delay, setDelay] = React.useState<number>(1);
  const [traverse, setTraverse] = React.useState<NodeType>(NodeType.Empty);
  const [boundaries, setBoundaries] = React.useState<boolean>(true);
  const [diagonalSearch, setDiagonalSearch] = React.useState<boolean>(true);

  React.useEffect(() => {
    create(rows, columns);
  }, [rows, columns]);

  return (
    <Box sx={{ display: 'flex' }}>
        <Drawer sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }} variant="permanent" anchor="left">
          <FormGroup>
            <FormControl variant="outlined" size='small' sx={{ m: 1 }}>
              <InputLabel id="demo-simple-select-standard-label">Algorithm</InputLabel>
              <Select label="Algorithm" value={algorithm} onChange={e => setAlgorithm(e.target.value as GridAlgorithm)}>
                <MenuItem value="astar">A-Star</MenuItem>
                <MenuItem value="dijkstra">Dijkstra's</MenuItem>
                <MenuItem value="dfs-stack">DFS - Stack</MenuItem>
                <MenuItem value="dfs-recursive">DFS - Recursive</MenuItem>
                <MenuItem value="bfs">Breadth First Search</MenuItem>
                <MenuItem value="count">Count</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size='small' sx={{ m: 1 }}>
              <InputLabel>Traverse</InputLabel>
              <Select label="Traverse" value={traverse} onChange={e => setTraverse(e.target.value as NodeType)}>
                <MenuItem value={NodeType.Empty}>Empty</MenuItem>
                <MenuItem value={NodeType.Wall}>Wall</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size='small' sx={{ m: 1 }}>
              <InputLabel>Speed</InputLabel>
              <Select label="Speed" value={delay} onChange={e => setDelay(+e.target.value)}>
                <MenuItem value={0}>Instant</MenuItem>
                <MenuItem value={1}>Fast</MenuItem>
                <MenuItem value={25}>Normal</MenuItem>
                <MenuItem value={100}>Slow</MenuItem>
              </Select>
            </FormControl>
            <FormGroup sx={{m: 1}} row>
              <FormControlLabel control={<Checkbox checked={boundaries} onChange={e => setBoundaries(e.currentTarget.checked)}/>} label="Boundaries" />
              <FormControlLabel control={<Checkbox checked={diagonalSearch} onChange={e => setDiagonalSearch(e.currentTarget.checked)}/>} label="Diagonal Search" />
            </FormGroup>
            <FormGroup sx={{m: 1, justifyContent: "space-between"}} row>
              <TextField type={"number"} label="Rows" size="small" value={rows} sx={{width: 70}} onChange={e => setRows(+e.target.value)}/>
              <TextField type={"number"} label="Columns" size="small" value={columns} sx={{width: 70}} onChange={e => setColumns(+e.target.value)}/>
              <TextField type={"number"} label="Size" size="small" value={nodeSize} sx={{width: 70}} onChange={e => setNodeSize(+e.target.value)}/>
            </FormGroup>
            <FormControl sx={{m: 1}}>
            </FormControl>
            <FormControl sx={{m: 1}}>
            </FormControl>
            <FormControl sx={{m: 1}}>
            </FormControl>
          </FormGroup>
        </Drawer>
        <Box 
          component={"main"}
          sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}          
        >
            <GridComponent 
            grid={grid}
            rows={rows} 
            columns={columns} 
            nodeSize={nodeSize}
            delay={delay}
            traverse={traverse}
            boundaries={boundaries}
            diagonalSearch={diagonalSearch}
            algorithm={algorithm}
            />
      </Box>
    </Box>
  );
}

export default App;
