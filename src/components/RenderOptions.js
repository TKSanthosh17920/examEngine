import React from 'react'
import { decodeHtml } from './utils';

const RenderOptions = ({ htmlString }) => {
    const decodedHtml = decodeHtml(htmlString);
    return (
        <div style={{marginLeft: "26px",marginTop: "-23px"}} dangerouslySetInnerHTML={{ __html: decodedHtml }} />
    );
}

export default RenderOptions
