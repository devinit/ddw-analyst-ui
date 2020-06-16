from subprocess import Popen, PIPE, STDOUT


def run_command(cmd):
    try:
        process = Popen(cmd, stdout=PIPE, stderr=STDOUT)
        output = process.stdout.read()
        exit_status = process.poll()
        if exit_status == 0:
            return {'status': "Successful", 'message': str(output)}
        else:
            return {'status': "Failed", 'message': str(output)}
    except Exception as e:
        return {'status': "Failed", 'message': str(e)}