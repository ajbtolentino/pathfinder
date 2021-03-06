import SportsScoreIcon from '@mui/icons-material/SportsScore';
import { useDrag } from 'react-dnd';
import { NodeType } from '../../models/Node';

export const NodeEnd = (props: {size: number}) => {
    const [{isDragging}, drag] = useDrag(() => ({
        type: "node",
        item: {type: NodeType.Goal},
        collect: monitor => ({
          isDragging: !!monitor.isDragging(),
        }),
      }));
      
    return <div ref={drag}>
        <SportsScoreIcon  
            style={{
                fontSize: props.size,
                display: "flex",
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move'}} />
    </div>;
}