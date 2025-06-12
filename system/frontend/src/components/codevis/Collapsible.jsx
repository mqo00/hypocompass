import { useState, useMemo, useEffect } from "react";
import * as refractor from "refractor";
// import useCollapse from 'react-collapsed';
import { diffLines, formatLines } from "unidiff";
import { parseDiff, Diff, Hunk, tokenize, markEdits } from "react-diff-view";
import "react-diff-view/style/index.css";
import "prism-themes/themes/prism-vs.css";

function Collapsible({ new_code, old_code }) {
  const [isExpanded, setOpen] = useState(false);
  // const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded });

  const renderToken = (token, defaultRender, i) => {
    switch (token.type) {
      case "space":
        return (
          <span key={i} className="space">
            {token.children &&
              token.children.map((token, i) =>
                renderToken(token, defaultRender, i)
              )}
          </span>
        );
      default:
        return defaultRender(token, i);
    }
  };
  const [{ type, hunks }, setDiff] = useState("");
  const [EMPTY_HUNKS, EMPTY_TYPE] = [[], "modify"];
  const tokens = useMemo(() => {
    if (!hunks) {
      return undefined;
    }
    const options = {
      refractor,
      highlight: true,
      language: "python",
      oldSource: old_code,
      enhancers: [markEdits(hunks)],
    };
    try {
      return tokenize(hunks, options);
    } catch (ex) {
      return undefined;
    }
    // eslint-disable-next-line
  }, [hunks]);

  const expandCollapsible = (open) => {
    const unidiff_text = diffLines(old_code, new_code);
    const diffText = formatLines(unidiff_text, { context: 3 });
    const [diff] = parseDiff(diffText, { nearbySequences: "zip" });
    setDiff(diff);
    console.log(diff, isExpanded);
    // if (open) { setOpen(true); return; } // default open code diff when there's a new code
    setOpen((old) => !old);
  };

  useEffect(() => {
    expandCollapsible(true);
    // eslint-disable-next-line
  }, [new_code]);

  return (
    <div className="collapsible">
      <div className="header">{"View Code Differences"}</div>
      <div>
        <div className="content">
          <Diff
            viewType="split"
            gutterType="none"
            renderToken={renderToken}
            diffType={type || EMPTY_TYPE}
            hunks={hunks || EMPTY_HUNKS}
            tokens={tokens}
          >
            {(hunks) =>
              hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)
            }
          </Diff>
        </div>
      </div>
    </div>
  );
}

export default Collapsible;
