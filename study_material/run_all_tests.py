import importlib
import os
from func_timeout import func_timeout, FunctionTimedOut


def get_inputs_from_file(filename):
  with open(filename, 'r') as inputs:
    for line in inputs:
      line = line.strip()
      if len(line) > 0 and not line.startswith('#'):
        yield line
    
class Implementation:
  def __init__(self, module_filename, function_name):
    module_name = os.path.relpath(module_filename).replace('/','.')[:-3] # strip .py
    self.module = importlib.import_module(module_name)
    importlib.reload(self.module)
    print('*** Module ***', dir(self.module), module_name, function_name)
    self.f = getattr(self.module, function_name)

  def test(self, params):
    # (x,y) != (x)
    input_params = eval('({},)'.format(params))
    # print('*** Input ***', input_params)
    # print("? FunctionTimedOut")
    return func_timeout(2, self.f, args=input_params)
    # return self.f(*input_params)


def run_file(dir_name, dir_code, file_name, function_name, inputs_filename='inputs.txt'):
  print('*** Testing implementation {} ***'.format(file_name))
  outputs = []
  try:
    implementation = Implementation(os.path.join(dir_code, file_name), function_name)
  except SyntaxError as e:
    print('-- Syntax error in {}'.format(file_name), type(e), e)
    return [str(type(e)) + " " + str(e)]
  except Exception as e:
    print('-- Other error in {}'.format(file_name), type(e), e)
    return [str(type(e)) + " " + str(e)]
  # run all tests
  for params in get_inputs_from_file(dir_name+inputs_filename):
    try:
      output = implementation.test(params)
      print(output)
      outputs.append(output)
    except FunctionTimedOut:
      print('-- Timeout error in {}'.format(file_name))
      outputs.append("FunctionTimedOut error")
    except Exception as e:
      print('-- Runtime error in {}'.format(file_name), type(e), e)
      outputs.append(str(type(e)) + " " + str(e))
  return outputs

def run_all_files(dir_name, dir_code, function_name):
  for impl in os.listdir(dir_code):
    if impl.endswith('.py'):
      out = run_file(dir_name, dir_code, impl, function_name)
      print('*** Outputs ***\n', out)
      
def run_problem(function_name):
  dir_name = f"problems/{function_name}/"
  dir_code = dir_name+"codes/student_buggy/"
  print('*** Running all tests ***', dir_code)
  run_all_files(dir_name, dir_code, function_name)
  

# Example usage:
  # run_problem(function_name)
  # directory = f"problems/{function_name}/"
  # run_file(directory, directory, 'refsol.py', function_name)