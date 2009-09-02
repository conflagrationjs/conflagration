require 'conflagration/controller'
require 'conflagration/processor'
require 'conflagration/browser'

module Conflagration
  class Application
    
    def initialize(options = {})
      raise ArgumentError, ":root is required" unless options[:root]
      @options = default_options.merge(options)
      @inited = false
    end
    
    def root
      @root ||= Pathname(@options[:root])
    end
    
    def pipe_dir
      @pipe_dir ||= root + "tmp/pipes"
    end
    
    # TODO - take something other than a raw rack env
    def process(env)
      raise "Please ensure you call init before processing" unless inited?
    end
    
    def environment
      @options[:environment]
    end
    
    def xul_application
      @options[:xul_application]
    end
    
    def init
      raise "Already initialized" if inited?
      make_controller
      make_processor
      spawn_browser
    end
    
    def inited?
      @inited
    end    

  private 
  
    def default_options
      {:environment     => 'development',
       :xul_application => Conflagration::ROOT + "xulapplication"}
    end
  
    def make_controller
      @controller = Conflagration::Controller.new(pipe_dir)
      @controller.init
    end
    
    def make_processor
      @processor = Conflagration::Processor.new(pipe_dir)
      @processor.init
    end
    
    def spawn_browser
      @browser = Conflagration::Browser.new(:xul_application => xul_application,
                                            :root            => root,
                                            :environment     => environment)
      @browser.init
    end
    
  end # Application
end   # Conflagration