require 'pathname'
(Pathname.new(__FILE__).parent + "rubyglue/conflagration/tasks").each_entry do |rakefile|
  next unless rakefile.extname == ".rake"
  require rakefile
end