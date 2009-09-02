require 'pathname'
require 'rack'
require 'thin'
require 'conflagration/rack_adapter'

module Conflagration
  class Server < Rack::File
    
    def initialize(application, options = {})
      @application = application
      @options = options
      @rack_adapter = Conflagration::RackAdapter.new(application)
      super((@application.root + "public").to_s)
    end
        
    def _call(env)
      catch(:conflagration_handoff) { return super(env) }
      # If we threw, there was a 404, so hand off to the Rack adapter.
      conflagration_handoff(env)
    end
    
    def run
      Rack::Handler::Thin.run(self, :Host => @options[:host], :Port => @options[:port])
    end
    
  private
    
    def not_found
      throw :conflagration_handoff
    end
    
    def conflagration_handoff(env)
      @rack_adapter.call(env)
    end
    
  end # Server
end   # Conflagration