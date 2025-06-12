import os
import json
import random
# from utilities.process_data import unpack_basic_stats, write_to_json
from utilities.run_tests import two_code_diff, get_impl_path, get_input_description

class CodeData:
    def __init__(self, basic_stats):
        self.problem_name = basic_stats["problem_name"]
        self.buggy_code_name = basic_stats["buggy_code_name"]
        self.code_dict = self.get_code_dict()
        self.buggy_code_obj = self.code_dict[self.buggy_code_name]
        self.buggy_code_dir = f'problems/{self.problem_name}/codes/buggy/{self.buggy_code_name}'
        assert self.buggy_code_obj["display_distractor"] == True
        self.distractors = self.buggy_code_obj["distractor_dict"]
        print("INIT CodeData Class", self.buggy_code_name)

    def get_code_dict(self):
        filename = f"problems/{self.problem_name}/codes_data.json"
        with open(filename, 'r') as f:
            json_list = json.load(f)
        return {code_data["code_name"]: code_data for code_data in json_list}

    def get_distractor_options(self):
        options = [{"value": self.buggy_code_name, "label": self.buggy_code_obj["expl_instruction"]}]
        for distractor_name in self.distractors.keys():
            distractor_obj = self.code_dict[distractor_name]
            options.append({"value": distractor_name, "label": distractor_obj["expl_instruction"]})
        random.shuffle(options)
        return options

    def get_prefixed_code(self):
        fixed_code_name = self.buggy_code_obj["fixed_code_name"]
        fixed_code = self.code_dict[fixed_code_name]["code"]
        fix_instruction = self.buggy_code_obj["fix_instruction"]
        fixed_code_filedir = f'problems/{self.problem_name}/codes/fixed/{fixed_code_name}'
        fixed_code_impl_path = get_impl_path(fixed_code_filedir)
        # if file not exist, write a code file to the fixed folder
        if not os.path.exists(fixed_code_filedir):
            with open(fixed_code_filedir, 'w+') as f:
                f.write(fixed_code)
        return fixed_code, fixed_code_impl_path, fixed_code_name, fix_instruction

    def get_hint_for_distractor(self, distractor_name, inputs_list):
        buggy_code = self.buggy_code_obj['code']
        distractor_code = self.code_dict[distractor_name]["code"]
        assert buggy_code != distractor_code
        print("===>>> get_hint_for_distractor", distractor_name)
        # write code1 and code2 to temp files and import the functions
        distractor_dir = f'problems/{self.problem_name}/codes/distractor/{distractor_name}'
        if not os.path.exists(distractor_dir):
            with open(distractor_dir, 'w+') as f:
                f.write(distractor_code)
        isDiff, diff_test = two_code_diff(buggy_code, distractor_code, self.buggy_code_dir,
                                          distractor_dir, self.problem_name, inputs_list)
        if isDiff: return False, format_diff_test(diff_test), None
        else:
            diff_test = self.distractors[distractor_name]["diff_test"]
            return True, format_diff_test(diff_test), get_input_description(self.problem_name, diff_test[0])

# diff_test = (test_input, actual_output, distractor_output)
def format_diff_test(diff_test):
    return {"test_input": str(diff_test[0]), "actual_output": str(diff_test[1]), "distractor_output": str(diff_test[2])}

def get_expl_distractors(basic_stats):
    code_data = CodeData(basic_stats)
    return code_data.get_distractor_options()

# can use user's test suite to give a hint on 
# return needAddTest, diff_test
def get_distractor_difftest(basic_stats, distractor_name, test_suite, selectedTC):
    code_data = CodeData(basic_stats)
    inputs_list = [selectedTC["input"]] + [test["input"] for test in test_suite.values()]
    return code_data.get_hint_for_distractor(distractor_name, inputs_list)

def get_prefixed_code(basic_stats, selected_failed_test):
    print("===>>> get_prefixed_code", selected_failed_test)
    code_data = CodeData(basic_stats)
    return code_data.get_prefixed_code()