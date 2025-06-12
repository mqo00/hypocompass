"""
Logic for selecting problems for a user to solve.
Assess user's level, bug type, problem done, etc.
"""

import os
import json


def get_problem_stats(file="problems/init_stats.json"):
    with open(file) as f:
        json_dict = json.load(f)
    return json_dict["problems"], json_dict["codes"], json_dict["testgroups"]


def get_init_testgroups(current_prob_index):
    current_prob_index = current_prob_index if current_prob_index != -1 else 0
    problems, _, testgroups = get_problem_stats()
    problem_name = problems[int(current_prob_index)]
    print(">> get init testgroups: ", current_prob_index, problem_name, testgroups[problem_name])
    return testgroups[problem_name]


def get_problem(current_prob_index=None):
    print(">>=== get problem: ", current_prob_index)
    problems, codes, _ = get_problem_stats()
    problem_name = problems[int(current_prob_index)
                            ] if current_prob_index != None else problems[0]
    buggy_codes = codes[problem_name] if problem_name in codes else []
    directory = f'problems/{problem_name}'
    with open(f'{directory}/description.txt', 'r') as f:
        description = f.read()
    return problem_name, description, buggy_codes


def getcode_outputs(buggy_dir, buggy_code_name, problem_name):
    # strip .py
    buggy_impl_path = f'problems.{problem_name}.codes.buggy.{buggy_code_name[:-3]}'
    with open(f'{buggy_dir}/{buggy_code_name}', 'r') as f:
        code = f.read().strip()
    return buggy_code_name, buggy_impl_path, code


def get_next_code(current_code_index=None, problem_name=None):
    print(">>=== get code: ", current_code_index)
    problems = get_problem_stats()[0]
    if problem_name in problems:
        problem_idx = problems.index(problem_name)
    else:
        problem_idx = 0
    problem_name, _, buggy_codes = get_problem(problem_idx)
    buggy_dir = f'problems/{problem_name}/codes/buggy/'

    if current_code_index == None:
        return getcode_outputs(buggy_dir, buggy_codes[0], problem_name)

    return getcode_outputs(buggy_dir, buggy_codes[int(current_code_index)], problem_name)
