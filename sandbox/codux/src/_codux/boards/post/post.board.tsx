import { createBoard } from '@wixc3/react-board';
import { Post } from '../../../components/post/post';

export default createBoard({
    name: 'Post',
    Board: () => <Post header='How Do I?' body={`Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sint totam, error provident possimus porro, neque corrupti eaque non cum praesentium beatae vitae! Labore nostrum reprehenderit repudiandae veniam nesciunt expedita omnis.`} />,
    environmentProps: {
        canvasWidth: 290,
        canvasHeight: 203
    }
});
