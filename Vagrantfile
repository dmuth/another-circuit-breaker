# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

	config.vm.define :bad_server do |host|
		#
		# Ubuntu 12.04 LTS
		#
		host.vm.box = "precise64"
		host.vm.box_url = "http://files.vagrantup.com/precise64.box"
  
		#
		# Each host gets a unique static IP so that they can talk to each other. 
		#
		host.vm.network "private_network", ip: "10.0.50.10"
		host.vm.graceful_halt_timeout = 10

	end

	config.vm.define :good_server do |host|
		host.vm.box = "precise64"
		host.vm.box_url = "http://files.vagrantup.com/precise64.box"
  
		host.vm.network "private_network", ip: "10.0.50.11"
		host.vm.graceful_halt_timeout = 10

	end

	config.vm.define :client do |host|
		host.vm.box = "precise64"
		host.vm.box_url = "http://files.vagrantup.com/precise64.box"
  
		host.vm.network "private_network", ip: "10.0.50.12"
		host.vm.graceful_halt_timeout = 10

	end



end


