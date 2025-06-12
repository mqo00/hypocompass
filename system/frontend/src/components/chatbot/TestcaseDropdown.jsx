import { observer } from "mobx-react-lite";
import "./ChatPage.css";
import Select from "react-select";
import { store } from "../../stores/Store";

// message data
export const TestcaseDropdown = observer(
  ({ testcaseIds, onSelectTestcase }) => {
    /******** */
    //const [selectedTestcase, setSelectedTestcase] = useState(null);
    const formatTCOptions = (testid) => {
      const test = store.testcaseDict[testid];
      return {
        value: test,
        label: (
          <div>
            <div>
              Input: <code>{test.input}</code>
            </div>{" "}
            <div>
              Exp. output: <code>{test.expected_output}</code>
            </div>{" "}
            <div>
              Act. output: <code>{test.actual_behavior}</code>
            </div>{" "}
          </div>
        ),
      };
    };
    const formatResponseText = (tc) => {
      if (!tc.pf) {
        const text = `<div>Consider this test case: given input <code>${tc.input}</code>, it is supposed to outputs <code>${tc.expected_output}</code>, however, the actual behavior is unexpected as the program outputs <code>${tc.actual_behavior}</code>. </div>`;
        return text;
      }
      return "";
    };
    const onChange = (selectedOption) => {
      const tc = selectedOption.value;
      if (tc.pf) {
        // filtered out so impoossible to select passing test case, don't populate textarea, hint
        store.setHint(
          "This test case actually pass! Re-select a failing test case for the student.",
          true
        );
        onSelectTestcase("", null);
      } else {
        const text = formatResponseText(tc);
        onSelectTestcase(text, tc);
      }
    };

    const wrongtestids = testcaseIds.filter(
      (tid) => !store.testcaseDict[tid].pf
    );
    if (wrongtestids.length === 0) {
      return null;
    }
    return (
      <Select
        key={testcaseIds.join("-")}
        options={wrongtestids.map((id) => formatTCOptions(id))}
        onChange={onChange}
      />
    );
  }
);
