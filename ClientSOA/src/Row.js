//functional component

import './Row.css';

const Row = (props) => {
    return <div className="Row">{props.children}</div>;
}

export default Row;