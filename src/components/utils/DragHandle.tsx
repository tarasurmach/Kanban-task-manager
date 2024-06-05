import {forwardRef} from "react";
import {Button} from "@chakra-ui/react";
import {DragHandleIcon} from "@chakra-ui/icons";


const DragHandle = forwardRef<HTMLButtonElement>((props, ref) => {
    return (
        <Button ref={ref} cursor={"grab"} {...props} style={{padding:""}}>
            <DragHandleIcon/>
        </Button>
    )
});

export default DragHandle;