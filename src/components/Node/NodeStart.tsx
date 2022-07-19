import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { useDrag } from 'react-dnd';

export const NodeStart = (props: {size: number}) => {
    const [{isDragging}, drag] = useDrag(() => ({
        type: "node",
        item: {type: "start"},
        collect: monitor => ({
          isDragging: !!monitor.isDragging(),
        }),
      }));
      
    return <div ref={drag}>
        <DirectionsRunIcon 
            style={{
                fontSize: props.size,
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move'}} />
    </div>
}