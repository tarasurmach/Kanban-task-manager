import {forwardRef} from "react";


const DragHandle = forwardRef<HTMLButtonElement>((props, ref) => {
    return (
        <button ref={ref}></button>
    )
});

export default DragHandle;