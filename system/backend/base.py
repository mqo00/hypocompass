# Import flask and datetime module for showing date and time
from flask import Flask, session, request
from utilities.problem_selection import get_problem, get_problem_stats, get_next_code, get_init_testgroups
from utilities.process_expl_fix import get_expl_distractors, get_distractor_difftest, get_prefixed_code
from utilities.process_data import add_testcase, write_user_data, evaluate_tests_postfix, evaluate_test_suite
from utilities.run_tests import current_code_correct
import time

# Initializing flask app
app = Flask(__name__)
app.secret_key = "debugging app"

@app.route("/")
def index():
    if 'username' in session:
        return "Logged in as" + session['username']
    return "<a href = '/login'>" + "click here to log in</a>"


# request.data is a bytestring that contains the raw data of the request body.
@app.route('/login', methods=['GET', 'POST'])
def login():
    print("===>>> start login====session", session)
    if request.method == 'GET':
        if 'username' in session:
            return {'username': session['username'], 'nickname': session['nickname']}
        return "User has not logged in yet"
    if request.method == 'POST':
        session['username'] = request.json['username']
        session['nickname'] = request.json['nickname']
        return "Logged in successfully"


@app.route('/logout', methods=['POST'])
def logout():
    if request.method == 'POST':
        print("logging out", session['username'])
        session.pop('username', None)
        session.pop('nickname', None)
        return "Logged out successfully"


@app.route('/get-num-problem', methods=['POST'])
def get_():
    if request.method == 'POST':
        return {
            "num_problem": len(get_problem_stats()[0])
        }


@app.route('/display-problem', methods=['POST'])
def display_problem():
    if request.method == 'POST':
        current_idx = request.json['problem_idx']
        problem_name, description, buggy_codes = get_problem(current_idx)
        return {
            'problem_name': problem_name,
            'description': description,
            "num_codes": len(buggy_codes)
        }


@app.route('/display-code', methods=['POST'])  # default methods = GET
def display_code():
    if request.method == 'POST':
        current_user = request.json['user']
        problem_name = request.json['problem_name']
        buggy_code_name, buggy_impl_path, code = get_next_code(
            current_user, problem_name)
        correctness, failed_input = current_code_correct(
            buggy_impl_path, problem_name)
        assert(correctness == False)
        return {
            'buggy_code_name': buggy_code_name,
            'buggy_impl_path': buggy_impl_path,
            'code': code,
            'ex_fail_inp': failed_input
        }


@app.route('/display-testgroup', methods=['POST'])
def display_testgroup():
    if request.method == 'POST':
        index = request.json['problem_index']
        testgroup = get_init_testgroups(index)
        return {'init_testgroup': testgroup}


@app.route('/add-tc', methods=['POST'])
def post_add_testcase():
    if request.method == 'POST':
        basic_stats = request.json['basics']
        input_string = request.json['input']
        expected_output = request.json['expected_output']
        tc_correct, refsol_output = add_testcase(
            basic_stats, input_string, expected_output)
        return {'tc_correct': tc_correct, 'refsol_output': refsol_output}


@app.route('/update-tg', methods=['POST'])
def update_testgroup():
    if request.method == 'POST':
        basic_stats = request.json['basics']
        user_action = request.json['action']
        testgroup = request.json['testgroup']
        write_user_data(basic_stats, user_action, testgroup)
        return user_action + " written to data file"


@app.route('/run-all-tests', methods=['POST'])
def run_all_tests():
    if request.method == 'POST':
        basic_stats = request.json['basics']
        tests = request.json['tests']
        updated_alltests = evaluate_test_suite(basic_stats, tests)
        return {'tests': updated_alltests}


@app.route('/submit-fix', methods=['POST'])
def post_submit_fix():
    if request.method == 'POST':
        basic_stats = request.json['basics']
        expl_code_id = request.json['expl_code_id']
        testlist = request.json['testlist']
        selectedTC = request.json['selectedTC']
        action = "submitExplanation/TCSelection (+sendFixedCode/verifySelection)"
        print(selectedTC, sep="\n")

        # 1. submit fix and store codex response data
        fixed_code, fixed_code_path, fixed_code_name, fix_instruction = get_prefixed_code(
            basic_stats, selectedTC)
        assert fixed_code is not None  # impossible when all fix are pregenerated
        write_user_data(basic_stats, action, {
                        "expl_code_id": expl_code_id, "fix_code": fixed_code, "selected_tcs": selectedTC})

        # 2. reevaluate testlist, store data and format response
        tests = evaluate_tests_postfix(basic_stats, testlist, fixed_code_path)
        # read from fix_instruction and set hint accordingly 
        hint = "Ok, I've made this change according to your explanation:\n" + fix_instruction + " Is it good now?"
        ex_fail_inp = current_code_correct(
            fixed_code_path, basic_stats['problem_name'])[1]
        # sleep for 2s until get back to frontend
        time.sleep(2)
        return {"fix_code": fixed_code, "tests": tests, "ex_fail_inp": ex_fail_inp,
                "fixed_code_path": fixed_code_path, "fixed_code_name": fixed_code_name, "hint": hint}


@app.route('/submit-distractor', methods=['POST'])
def post_submit_distractor():
    if request.method == 'POST':
        basic_stats = request.json['basics']
        distractor_name = request.json['distractor_name']
        test_suite = request.json['test_suite']
        selectedTC = request.json['selectedTC']
        action = "submitDistractor"
        needAddTest, diff_test, inp = get_distractor_difftest(
            basic_stats, distractor_name, test_suite, selectedTC)
        write_user_data(basic_stats, action, {
                        "distractor_name": distractor_name, "diff_test": diff_test, "need_add_test": needAddTest})
        return {"needAddTest": needAddTest, "diff_test": diff_test, "inp": inp}


@app.route('/display-expl-pool', methods=['POST'])
def display_expl_pool():
    if request.method == 'POST':
        basic_stats = request.json['basics']
        if not "buggy_code_name" in basic_stats:
            return None
        return get_expl_distractors(basic_stats)


@app.route('/save-buttons', methods=['POST'])
def save_buttons():
    if request.method == 'POST':
        basic_stats = request.json['basics']
        action = request.json['action']
        write_user_data(basic_stats, action, {"selected_code_state": action})
        return "logged saved buttons" + action


# Running app
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8090, debug=True)