import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import { observer } from "mobx-react-lite";

export const CodeShow = observer(({ code }) => {
  if (code === null) {
    return null;
  }
  return (
    <>
      <div className="text-header">Student's Current Code</div>
      <SyntaxHighlighter
        className="code-text"
        language="python"
        style={coy}
        wrapLongLines={false}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </>
  );
});
