require 'pathname'

module Conflagration
  class BrowserRunner
    class Browser
      # TODO - clean up this class - the application.ini stuff, etc
      
      def initialize(browser_path = nil)
        @browser_path = browser_path || determine_browser_path
      end
      
      def create_profile(profile_name, xul_app_dir)
        system(@browser_path, "-app", (Pathname(xul_app_dir) + "application.ini").expand_path.to_s, "-CreateProfile", profile_name)
      end

      def execute(options = {})
        xul_application_ini = (Pathname(options[:xul_application]) + "application.ini").expand_path.to_s
        pid = fork do
          options.each { |k,v| ENV[k.to_s] = v.to_s }
          run_headless if options[:headless]
          # Change our group so the browser doesn't die when the spawner does. This would be bad.
          Process.setpgid(0, Process.pid)
          exec(@browser_path, "-app", xul_application_ini, "-P", options[:application_name])
        end
        # Detach so firefox doesn't auto-die when we do.
        Process.detach(pid)
        return pid.to_i
      end
      
    private
      
      def run_headless
        raise "Not Implemented"
      end
      
      def determine_browser_path
        raise "This method must be implemented in OS specific implementation of browser"
      end
      
    end
    
    class DarwinBrowser < Browser
      FirefoxBinLocation = "Firefox.app/Contents/MacOS/firefox-bin"
      
    private
    
      def determine_browser_path
        assumed_firefox_location = applications_folder + FirefoxBinLocation
        if !assumed_firefox_location.exist?
          raise "Assumed we could find Firefox in '#{assumed_firefox_location}' but it does not seem to exist."
        else
          assumed_firefox_location.to_s
        end
      end
      
      def applications_folder
        @applications_folder ||= Pathname(`osascript -e 'POSIX path of (path to applications folder)'`.chomp)
      end
      
    end
    
    class LinuxBrowser < Browser
      
      def determine_browser_path
        assumed_firefox_location = `which firefox`.chomp
        if $? != 0
          raise "Can not seem to locate Firefox in your PATH."
        else
          assumed_firefox_location
        end
      end
      
    end
    
    def initialize(options = {})
      @options = options
      @browser = create_os_specific_browser
    end
    
    def init
      return true if running?
      @browser.create_profile(@options[:application_name], @options[:xul_application])
      pid = @browser.execute(:xul_application        => @options[:xul_application],
                             :application_name       => @options[:application_name],
                             :application_root       => @options[:root],
                             :headless               => @options[:headless],
                             :environment            => @options[:environment],
                             :controller_input_pipe  => @options[:controller_input_pipe],
                             :controller_output_pipe => @options[:controller_output_pipe])
      write_pidfile(pid)
    end
    
    def running?
      pid = last_known_pid
      if pid
        return !Process.kill(0, pid).zero?
      else
        return false
      end
    rescue Errno::ESRCH
      return false
    end
    
    def last_known_pid
      if pidfile.exist?
        pidfile.read.to_i
      else
        nil
      end
    end
    
    def pidfile
      @pidfile ||= Pathname(@options[:pidfile])
    end
    
  private
    
    def write_pidfile(pid)
      pidfile.open('w') { |f| f << pid }
    end
    
    def create_os_specific_browser
      self.class.const_get("#{os.capitalize}Browser").new(@options[:browser_path])
    end
    
    def os
      @os ||= `uname -s`.chomp
    end
    
  end
end