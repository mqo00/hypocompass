import Collapsible from "./Collapsible";
import { observer } from "mobx-react-lite";

export const CodeDiff = observer(({ new_code, old_code }) => {
  if (new_code === null || old_code == null) {
    return null;
  }
  return (
    <div className="code-diff" key={`${new_code}-${old_code}`}>
      <Collapsible old_code={old_code} new_code={new_code} />
    </div>
  );
});
