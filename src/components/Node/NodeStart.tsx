import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { useDrag } from 'react-dnd';
import { NodeType } from '../../models/Node';

export const NodeStart = (props: {size: number}) => {
    const [{isDragging}, drag] = useDrag(() => ({
        type: "node",
        item: {type: NodeType.Start},
        collect: monitor => ({
          isDragging: !!monitor.isDragging(),
        }),
      }));
      
    return <>
      <div ref={drag} style={{display: "flex"}}>
          <DirectionsRunIcon 
              style={{
                display: "flex",
                fontSize: props.size,
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move'}} />
      </div>
    </>
}