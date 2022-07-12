import { Button, ButtonGroup, Checkbox, Drawer, FormControl, FormControlLabel, FormGroup, FormLabel, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, TextField, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import './App.css';
import Grid, { GridAction, GridAlgorithm } from './components/Grid/Grid';
import React from 'react';
import { NodeType } from './models/INode';

const drawerWidth = 260;

const App = () => {
  const [algorithm, setAlgorithm] = React.useState<GridAlgorithm>("astar");
  const [rows, setRows] = React.useState<number>(20);
  const [columns, setColumns] = React.useState<number>(30);
  const [nodeSize, setNodeSize] = React.useState<number>(30);

  const [delay, setDelay] = React.useState<number>(1);
  const [traverse, setTraverse] = React.useState<NodeType>("empty");
  const [boundaries, setBoundaries] = React.useState<boolean>(true);
  const [animate, setAnimate] = React.useState<boolean>(true);

  const [gridAction, setGridAction] = React.useState<GridAction>("none");

  const handleDone = () => {
    setGridAction("restart");
    alert("Done!");
  }

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
                <MenuItem value="empty">Empty</MenuItem>
                <MenuItem value="wall">Wall</MenuItem>
              </Select>
            </FormControl>
            <FormGroup sx={{m: 1}} row>
              <FormControlLabel control={<Checkbox checked={animate} onChange={e => setAnimate(e.currentTarget.checked)}/>} label="Animate" />
              <TextField type={"number"} label="Delay (ms)" size="small" sx={{width: 130}} value={delay} onChange={e => setDelay(+e.target.value)}/>
            </FormGroup>
            <FormGroup sx={{m: 1}} row>
              <FormControlLabel control={<Checkbox checked={boundaries} onChange={e => setBoundaries(e.currentTarget.checked)}/>} label="Boundaries" />
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

            <ButtonGroup sx={{m: 1}}>
              <Button disabled={gridAction === "start"} onClick={() => setGridAction("start")}>Start</Button>
              <Button disabled={gridAction === "reset" || gridAction === "none"} onClick={() => setGridAction("reset")}>Reset</Button>
              <Button disabled={gridAction === "clear" || gridAction === "none"} onClick={() => setGridAction("clear")}>Clear</Button>
            </ButtonGroup>
          </FormGroup>
        </Drawer>
        <Box 
          component={"main"}
          sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}          
        >
        <Grid 
          rows={rows} 
          columns={columns} 
          nodeSize={nodeSize}
          delay={delay}
          traverse={traverse}
          boundaries={boundaries}
          animate={animate}
          algorithm={algorithm}
          action={gridAction}
          done={handleDone}
        />
      </Box>
    </Box>
  );
}

export default App;
