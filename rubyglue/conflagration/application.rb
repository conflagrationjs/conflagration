require 'conflagration/controller'
require 'conflagration/processor'
require 'conflagration/browser_runner'

module Conflagration
  class Application
    
    def initialize(options = {})
      raise ArgumentError, ":root is required" unless options[:root]
      @options = default_options.merge(options)
      @inited = false
    end
    
    def root
      @root ||= Pathname(@options[:root]).expand_path
    end
    
    def pipe_dir
      @pipe_dir ||= root + "tmp/pipes"
    end
    
    def pid_dir
      @pid_dir ||= root + "tmp/pids"
    end
    
    # TODO - take something other than a raw rack env
    def process(env)
      raise "Please ensure you call init before processing" unless inited?
      @processor.process(env)
    end
    
    def shutdown_browser?
      !!@options[:shutdown_browser]
    end
    
    def headless?
      !!@options[:headless]
    end
    
    def environment
      @options[:environment]
    end
    
    def xul_application
      @options[:xul_application]
    end
    
    def application_name
      @application_name ||= @options[:application_name] || root.basename.to_s
    end
    
    def init
      raise "Already initialized" if inited?
      make_controller
      make_processor
      spawn_browser_runner
      spawn_application_handler
      setup_exit_handler
      @inited = true
    end
    
    def inited?
      @inited
    end    

    def cleanup
      stop_request_listener
      shutdown_application_handler
      cleanup_pipes
      shutdown_browser
      exit(0)
    end
        
  private 
  
    def shutdown_browser
      return unless shutdown_browser?
      @controller.shutdown_browser
    end
    
    def stop_request_listener
      @processor.stop_request_listener
    end
    
    def shutdown_application_handler
      @controller.shutdown_application_handler
    end
    
    def cleanup_pipes
      @processor.cleanup_pipes
    end
    
    def setup_exit_handler
      at_exit { self.cleanup }
    end
  
    def default_options
      {:environment      => 'development',
       :xul_application  => Conflagration::LIBRARY_ROOT + "xulapplication"}
    end
  
    def make_controller
      @controller = Conflagration::Controller.new(pipe_dir)
      @controller.init
    end
    
    def make_processor
      @processor = Conflagration::Processor.new(pipe_dir)
      @processor.init
    end
    
    def spawn_browser_runner
      @browser = Conflagration::BrowserRunner.new(:xul_application        => xul_application,
                                                  :application_name       => application_name,
                                                  :headless               => headless?,
                                                  :root                   => root,
                                                  :pidfile                => pid_dir + "firefox.pid",
                                                  :controller_input_pipe  => @controller.input_pipe.to_s,
                                                  :controller_output_pipe => @controller.output_pipe.to_s,
                                                  :environment            => environment)
      @browser.init
    end
    
    def spawn_application_handler
      @controller.spawn_application_handler(@processor)
    end
    
  end # Application
end   # Conflagration