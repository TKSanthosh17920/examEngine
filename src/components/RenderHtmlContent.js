import { decodeHtml } from './utils';


const RenderHtmlContent1 = ({ htmlString }) => {
    const decodedHtml = decodeHtml(htmlString);
    return (
        <div style={{marginLeft: "26px",marginTop: "-23px"}} dangerouslySetInnerHTML={{ __html: decodedHtml }} />
    );
};

export default RenderHtmlContent1;