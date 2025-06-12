import os
import json
import importlib
from func_timeout import func_timeout, FunctionTimedOut

def get_inputs(problem_name, dir_name=None):
  dir_name = dir_name or f'problems/{problem_name}/'
  with open(dir_name+'inputs.txt', 'r') as inputs:
    for line in inputs:
      line = line.strip()
      if len(line) > 0 and not line.startswith('#'):
        yield line

def get_params(input_string): # (x,y) != (x)
  return eval('({},)'.format(input_string))

def get_impl_path(filename_dir):
  return os.path.relpath(filename_dir).replace('/','.')[:-3] # strip .py

def get_input_description(problem_name, input_string):
  filename = f"problems/{problem_name}/tests_hint.json"
  with open(filename, 'r') as f: 
    json_dict = json.load(f)
  if input_string not in json_dict:
    return {"input": input_string, "input_descr": f""}
  print("===>>> get_testcase_description", input_string, json_dict[input_string])
  return {"input": input_string, "input_descr": json_dict[input_string]}



# The Implementation class for a problem & function at impl_path
class Implementation:
  def __init__(self, impl_path, problem_name):
    self.module = importlib.import_module(impl_path)
    self.problem_name = problem_name
    self.f = getattr(self.module, problem_name)

  def test(self, inputs): # (x,y) != (x)
    # return self.f(*input_params)
    return func_timeout(2, self.f, args=get_params(inputs))


# Template function for running a file
def run_file(dir_name, dir_code, file_name, function_name):
  print('*** Testing implementation {} ***'.format(file_name))
  try:
    module_filename = os.path.join(dir_code, file_name)
    module_name = get_impl_path(module_filename)
    impl = Implementation(module_name, function_name)
  except SyntaxError:
    print('-- Syntax error in {}'.format(file_name))
    return
  for params in get_inputs(function_name, dir_name+'inputs.txt'):
    try:
      print(impl.test(params))
    except FunctionTimedOut:
      print('-- Timeout error in {}'.format(file_name))
    except Exception as e:
      print('-- Runtime error in {}'.format(file_name), type(e).__name__, e)

# Run the given implementation on a given input
def run_input(impl, inputs):
  try:
    return impl.test(inputs)
  except SyntaxError:
    return 'Exception: <SyntaxError>'
  except FunctionTimedOut:
    return 'Exception: <TimeoutError>'
  except Exception as e:
    return f'Exception: <{type(e).__name__}> {e}'

# loop through all instructor inputs, compare current code output with refsol output
def current_code_correct(code_impl_path, problem_name):
  refsol_path = f'problems.{problem_name}.refsol'
  refsol = Implementation(refsol_path, problem_name)
  impl = Implementation(code_impl_path, problem_name)
  print("EVALUATING CURRENT CODE vs REFSOL")
  for inputs in get_inputs(problem_name):
    print(inputs)
    refsol_output = run_input(refsol, inputs)
    impl_output = run_input(impl, inputs)
    if refsol_output != impl_output:
      # it could be exception don't match, or output value don't match, etc.
      print("current code output doesn't match refsol output at input: ", inputs)
      return False, get_input_description(problem_name, inputs)
  print("current code output MATCH refsol output for all inputs")
  return True, None


def compare_outputs(impl_output, output_string):
  impl_output = str(impl_output).replace("'", '"')
  impl_output = str(impl_output).replace(' ', '')

  output_string = str(output_string).replace("'", '"')
  output_string = str(output_string).replace(' ', '')

  print(f"==Compare impl_output={impl_output}, output_string={output_string}")
  return str(impl_output) == output_string



# Check if the function {problem_name} at {impl_path}, when called with input_string, match output_string
# Returns ( output_match: T/F, impl_output: the output of the impl, and raise_exception: T/F )
def check_output_against_impl(input_string, output_string, impl_path, problem_name):
  impl = Implementation(impl_path, problem_name)
  impl_output = run_input(impl, input_string)
  print(f"==Input {input_string}, check output {output_string} against impl: {impl_output}")
  raised_exception = str(impl_output).startswith("Exception: <")
  # may raise exception if eval(output_string), so couldn't cmp type(impl_output) == type(output)
  # output_match = str(impl_output) == output_string
  output_match = compare_outputs(impl_output, output_string)
  if output_match: # output_string == impl_output:
    return True, impl_output, raised_exception
  else:
    return False, impl_output, raised_exception
    

# compare two code on a list of inputs, if behavior different, return the input and diff outputs
# return (isDiff: T/F, diff: {inputs, impl_output1, impl_output2} or None)
def two_code_diff(code1, code2, codedir1, codedir2, problem_name, inputs_list):
    impl1 = Implementation(get_impl_path(codedir1), problem_name)
    impl2 = Implementation(get_impl_path(codedir2), problem_name)

    print("EVALUATING TWO CODE on", inputs_list, code1, code2, sep="\n")
    for inputs in inputs_list:
      impl_output1 = run_input(impl1, inputs)
      impl_output2 = run_input(impl2, inputs)
      if impl_output1 != impl_output2:
        print("two code output diff at input: ", inputs, impl_output1, impl_output2)
        return True, (inputs, impl_output1, impl_output2)
        # diff_test = (test_input, actual_output, distractor_output)

    print("two code output MATCH for all inputs")
    return False, None
