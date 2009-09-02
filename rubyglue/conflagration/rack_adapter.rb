require 'conflagration/application'

module Conflagration
  class RackAdapter
    
    def initialize(application)
      @application = application
    end
    
    # TODO - pass in something other than just the raw env.
    def call(env)
      response = @application.process(env)
      [response[:status], response[:headers], response[:body]]
    end
    
  end # RackAdapter
end   # Conflagration