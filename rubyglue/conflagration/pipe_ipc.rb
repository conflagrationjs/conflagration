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
      if !File.exists?(@input_pipe.to_s)
        system("mkfifo", "-m", "600", @input_pipe.to_s)
      elsif !File.pipe?(@input_pipe.to_s) || !File.readable?(@input_pipe.to_s)
        raise IOError, "Input pipe path '#{@input_pipe}' is not a pipe or is not readable"
      end
    end

    def create_output_pipe
      if !File.exists?(@output_pipe.to_s)
        system("mkfifo", "-m", "600", @output_pipe.to_s)
      elsif !File.pipe?(@output_pipe.to_s) || !File.readable?(@output_pipe.to_s)
        raise IOError, "Output pipe path '#{@output_pipe}' is not a pipe or is not readable"
      end
    end
    
  end
end
