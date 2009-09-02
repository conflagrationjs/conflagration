require 'pathname'
$LOAD_PATH << (Pathname(__FILE__).parent.parent + "rubyglue").expand_path.to_s

module Conflagration
  LIBRARY_ROOT = Pathname(__FILE__).parent.parent
end