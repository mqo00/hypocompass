"""
process user requests
format data and store in the data folder
"""
import os
import json
from pathlib import Path
from datetime import datetime
from utilities.run_tests import check_output_against_impl, run_input, Implementation


def unpack_basic_stats(basic_stats):
    userid = basic_stats["userid"]
    problem_name = basic_stats["problem_name"]
    buggy_code_name = basic_stats["buggy_code_name"] if "buggy_code_name" in basic_stats else "before_code_added"
    return userid, problem_name, buggy_code_name


def write_to_json(directory, file_name, json_obj):
    p = Path(directory)
    p.mkdir(parents=True, exist_ok=True)
    file = f"{directory}/{file_name}"

    print(file)
    if not os.path.exists(file):  # create file not exist and write empty list
        with open(file, 'w+') as f:
            json.dump([], f)
    with open(file) as f:
        json_list = json.load(f)
        json_list.append(json_obj)  # need to be not a dict

    with open(file, 'w') as f:
        json.dump(json_list, f, separators=(',', ': '), indent=4)
    return


def get_user_data_dir(basic_stats):
    userid, problem_name, buggy_code_name = unpack_basic_stats(basic_stats)
    directory = f"data/{userid}/{problem_name}/{buggy_code_name}"
    file_name = f"{userid}_data.json"
    return directory, file_name


def format_data_entry(basic_stats, user_action, data):
    userid, problem_name, buggy_code_name = unpack_basic_stats(basic_stats)
    now = datetime.now()
    data_entry = {
        "time": now.strftime("%Y-%m-%d %H:%M:%S"),
        "timestamp": datetime.timestamp(now),
        "userid": userid,
        "problem_name": problem_name,
        "buggy_code_name": buggy_code_name,
        "user_action": user_action,
        "data": data
    }
    return data_entry


def write_user_data(basic_stats, user_action, data):
    directory, file_name = get_user_data_dir(basic_stats)
    json_obj = format_data_entry(basic_stats, user_action, data)
    write_to_json(directory, file_name, json_obj)


# evaluate all test cases in alltests against the buggy code in impl_path, load impl only once
def evaluate_test_suite(basic_stats, alltests, exception_msg="raise Exception"):
    # destructively modifying alltests and return the updated one with pf and actual_output
    directory, file_name = get_user_data_dir(basic_stats)
    problem_name, code_impl_path = basic_stats["problem_name"], basic_stats["buggy_impl_path"]
    refsol_path = f'problems.{problem_name}.refsol'
    refsol = Implementation(refsol_path, problem_name)
    impl = Implementation(code_impl_path, problem_name)
    print("EVALUATING CURRENT CODE on TEST SUITE")
    for tc in alltests.values():
        input_string = tc["input"]
        # set hasbeen_evaluated to True here instead of set_evaluation in App.js
        tc["has_been_evaluated"] = True
        refsol_output = run_input(refsol, input_string)
        impl_output = run_input(impl, input_string)
        # expected_output (str) no type check, more robust if using refsol
        pf = refsol_output == impl_output
        print("code output match refsol at input: ", input_string, "?", pf)
        tc['pf'] = pf
        tc['actual_behavior'] = str(impl_output).replace(
            "<", "[").replace(">", "]")
        # buggy output can be None: when the code doesn't return at that point, which can cause bug if don't turn it into str

    json_obj = format_data_entry(
        basic_stats, 'evaluateTS (verifyActualOutput)', alltests)
    write_to_json(directory, file_name, json_obj)
    return alltests

# TODO: differentiate between invalid input vs. output, check input format? spec, expected types of input
# invalid input (False, None), wrong expected output (False, ), pass (True, None)


def add_testcase(basic_stats, input_string, expected_output, exception_msg="raise Exception"):
    # directory = f"data/{userid}/{problem_name}/before_code_added"
    directory, file_name = get_user_data_dir(basic_stats)
    problem_name = basic_stats["problem_name"]
    # evaluate against refsol, basic_stats has userid and problem_name
    tc_correct, refsol_output, raise_exception = check_output_against_impl(
        input_string, expected_output, f'problems.{problem_name}.refsol', problem_name)
    # keep None, otherwise will be null in frontend
    return_output = str(refsol_output)
    if raise_exception:
        return_output = exception_msg  # or return the error message if needed
        # refsol's actual output can actually be None given a valid input
    testcase = {
        "input": input_string,
        "expected_output": expected_output,
        "refsol_output": refsol_output,
        "tc_correct": tc_correct
    }
    json_obj = format_data_entry(
        basic_stats, "addTC (+verifyExpectedOutput)", testcase)
    print("add_testcase: ", json_obj)
    write_to_json(directory, file_name, json_obj)
    return tc_correct, return_output


# 2. Postfix: evaluate if the testcases pass after the fix is applied
# compare current code actual_output with fixed_output
# return the actual behavioral change
def evaluate_tests_postfix(basic_stats, usertests, fixed_code_path):
    tests = {}
    print(usertests, basic_stats["buggy_impl_path"])
    for (tcidx, tc) in usertests.items():
        input_string = tc["input"]
        output = tc["expected_output"]
        fixed_code_pf, fixed_code_output, _ = check_output_against_impl(
            input_string, output, fixed_code_path, basic_stats["problem_name"])
        tests[tcidx] = {"pf": fixed_code_pf,
                        "actual_behavior": str(fixed_code_output)}
        # print("check outputs:", type(fixed_code_output), fixed_code_output, type(tc["actual_behavior"]), tc["actual_behavior"])

    return tests
