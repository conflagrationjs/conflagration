# TODO - merge stuff from Controller and Processor to PipeIPC
require 'conflagration/pipe_ipc'
require 'json/pure'

module Conflagration
  class Processor < PipeIPC
    InputName = "conflagration.%s.processor.input.pipe"
    OutputName = "conflagration.%s.processor.output.pipe"
    
    def initialize(pipe_dir)
      super(pipe_dir)
      @input_pipe = @pipe_dir + (InputName % Process.pid)
      @output_pipe = @pipe_dir + (OutputName % Process.pid)
    end

    def process(rack_env)
      output_pipe = @output_pipe.open(Fcntl::O_WRONLY)
      output_pipe.fcntl(Fcntl::F_WRLCK)
      output_pipe.puts({'messageType' => 'Request', 'rackEnv' => rack_env}.to_json)
      output_pipe.flush
      output_pipe.close
      input_pipe = @input_pipe.open(Fcntl::O_RDONLY)
      input_pipe.fcntl(Fcntl::F_RDLCK)
      dispatch_response(JSON.parse(input_pipe.readline))
    ensure
      output_pipe.close unless output_pipe.closed?
      input_pipe.close
    end

    def cleanup_pipes
      @input_pipe.unlink
      @output_pipe.unlink
    end
    
    def stop_request_listener
      output_pipe = @output_pipe.open(Fcntl::O_WRONLY)
      output_pipe.fcntl(Fcntl::F_WRLCK)
      output_pipe.puts({'messageType' => 'StopListening'}.to_json)
      output_pipe.flush
      output_pipe.close
      input_pipe = @input_pipe.open(Fcntl::O_RDONLY)
      input_pipe.fcntl(Fcntl::F_RDLCK)
      response = JSON.parse(input_pipe.readline)
      if response['messageType'] != 'ListeningStopped'
        raise "Server did not stop listening for an unknown reason."
      end
    ensure
      output_pipe.close unless output_pipe.closed?
      input_pipe.close
    end
    
    def dispatch_response(json_message)
      {:status => json_message['status'], :headers => json_message['headers'], :body => json_message['body']}
    end
    
  end
end
