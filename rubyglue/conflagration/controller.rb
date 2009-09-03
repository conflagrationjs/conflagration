# TODO - merge stuff from Controller and Processor to PipeIPC
# TODO - haha. all this copied and pasted code. Yeah, fix that.
require 'conflagration/pipe_ipc'
require 'json/pure'

module Conflagration
  class Controller < PipeIPC
    InputName = "conflagration.input.pipe"
    OutputName = "conflagration.output.pipe"
    
    def initialize(pipe_dir)
      super(pipe_dir)
      @input_pipe = @pipe_dir + InputName
      @output_pipe = @pipe_dir + OutputName
    end

    def spawn_application_handler(processor)
      output_pipe = @output_pipe.open(Fcntl::O_WRONLY)
      input_pipe = @input_pipe.open(Fcntl::O_RDONLY | Fcntl::O_NONBLOCK)
      output_pipe.fcntl(Fcntl::F_WRLCK)
      input_pipe.fcntl(Fcntl::F_RDLCK)
      output_pipe.puts(spawn_message(processor.input_pipe, processor.output_pipe).to_json)
      output_pipe.flush
      output_pipe.close
      # Wait for the response
      while input_pipe.eof? do
        sleep(0.5)
      end
      dispatch_message(JSON.parse(input_pipe.readline))
    ensure
      output_pipe.close unless output_pipe.closed?
      input_pipe.close
    end
    
    def shutdown_application_handler
      output_pipe = @output_pipe.open(Fcntl::O_WRONLY)
      input_pipe = @input_pipe.open(Fcntl::O_RDONLY | Fcntl::O_NONBLOCK)
      output_pipe.fcntl(Fcntl::F_WRLCK)
      input_pipe.fcntl(Fcntl::F_RDLCK)
      output_pipe.puts(shutdown_message.to_json)
      output_pipe.flush
      output_pipe.close
      # Wait for the response
      while input_pipe.eof? do
        sleep(0.5)
      end
      dispatch_message(JSON.parse(input_pipe.readline))
    ensure
      output_pipe.close unless output_pipe.closed?
      input_pipe.close
    end

    # TODO - this is shithouse. We should probably get notification from the browser just before it exits. For now, we don't care.
    def shutdown_browser
      output_pipe = @output_pipe.open(Fcntl::O_WRONLY)
      output_pipe.fcntl(Fcntl::F_WRLCK)
      output_pipe.puts(shutdown_browser_message.to_json)
      output_pipe.flush
      output_pipe.close
    ensure
      output_pipe.close unless output_pipe.closed?
    end
    
  private
  
    def spawn_message(input_pipe, output_pipe)
      {'messageType' => 'SpawnServer', 'inputPipe' => input_pipe.expand_path.to_s, 
       'outputPipe' => output_pipe.expand_path.to_s, 'gluePID' => Process.pid}
    end
    
    def shutdown_message
      {'messageType' => 'ShutdownServer', 'gluePID' => Process.pid}
    end
   
    def shutdown_browser_message
      {'messageType' => 'ShutdownBrowser'}
    end
    
    def dispatch_message(msg)
      puts "Got message: #{msg.inspect}"
    end
    
  end
end