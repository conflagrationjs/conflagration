require 'conflagration/pipe_ipc'

module Conflagration
  class Processor < PipeIPC
    InputName = "conflagration.%s.processor.input.pipe"
    OutputName = "conflagration.%s.processor.output.pipe"
    
    def initialize(pipe_dir)
      super(pipe_dir)
      @input_pipe = @pipe_dir + (InputName % Process.pid)
      @output_pipe = @pipe_dir + (OutputName % Process.pid)
    end
    
  end
end
