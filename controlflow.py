import bdb
import time


class Flow(bdb.Bdb):
    def __init__(self):
        super().__init__()

        self._MAXLINE = 10000

        self.prev_line = None
        self.line_num = 0
        self.lines_left = self._MAXLINE
        self.branches = []
        self.early_stop = False

    def user_line(self, frame):
        """This method is called from dispatch_line() when either 
        stop_here() or break_here() yields True.
        """
        self.lines_left -= 1

        if self.lines_left <= 0:
            self.set_quit()
            self.early_stop = True

        if "<string>" not in str(frame.f_code):
            return

        self.line_num += 1

        if self.prev_line and frame.f_lineno != self.prev_line + 1:
            src = frame.f_lineno
            dst = self.prev_line

            edge = (src, dst)

            self.branches.append(edge)

        # print(frame.f_code, frame.f_lasti)

        self.prev_line = frame.f_lineno

    def process_script(self, script):
        try:
            ts = time.time()
            self.run(script)
            delta = time.time() - ts

        except Exception as e:
            print(e)

        return delta, self.branches, self.early_stop

EXAMPLE = """# Recursive Fibonacci series
import functools

@functools.lru_cache(maxsize=None) #128 by default
def fib(num):
    if num < 2:
        return 1
    else:
        return fib(num-1) + fib(num-2)

fib(5)
"""

if __name__ == "__main__":
    processor = Flow()
    print(processor.process_script(EXAMPLE))
