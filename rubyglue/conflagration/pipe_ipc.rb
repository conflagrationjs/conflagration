require 'fcntl'

module Conflagration
  class PipeIPC
    attr_reader :input_pipe, :output_pipe
    
    def initialize(pipe_dir)
      @pipe_dir = Pathname(pipe_dir)
    end
    
    def init
      create_input_pipe
      create_output_pipe
    end
    
  private

    # TODO - cross-platform-ize
    def create_input_pipe
      if !@input_pipe.exist?
        system("mkfifo", "-m", "600", @input_pipe.to_s)
      end
    end

    def create_output_pipe
      if !@output_pipe.exist?
        system("mkfifo", "-m", "600", @output_pipe.to_s)
      end
    end
    
  end
end
