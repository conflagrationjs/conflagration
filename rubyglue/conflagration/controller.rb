require 'conflagration/pipe_ipc'

module Conflagration
  class Controller < PipeIPC
    InputName = "conflagration.input.pipe"
    OutputName = "conflagration.output.pipe"
    
    def initialize(pipe_dir)
      super(pipe_dir)
      @input_pipe = @pipe_dir + InputName
      @output_pipe = @pipe_dir + OutputName
    end
    
    # @input_pipe.open(Fcntl::O_RDONLY | Fcntl::O_NONBLOCK)
    # @output_pipe.open(Fcntl::O_WRONLY | Fcntl::O_NONBLOCK)
    
  end
end