/*
 * Released under BSD License
 * Copyright (c) 2014-2015 hizzgdev@163.com
 * 
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 */

(function($w){
    "use strict";
    var $d = $w.document;
    var __name__ = 'jsMind';
    var jsMind = $w[__name__];
    if(!jsMind){return;}

    var options = {
        play_delay : 1000
    };

    jsMind.shell = function(jm){
        this.jm = jm;
        this.step = 0;
        this.commands = []; //version
        this.delay_handle = 0;
        this.recording = false;
        this.playing = false;
        this.jm_editable = true;
    };

    jsMind.shell.prototype = {
        init:function(){
            this.playing = false;
        },
        record:function(action,obj){
            if(!this.playing){
                var command = {action:action,data:obj.data,node:obj.node};
                this.step = this.commands.push(command);
            }
        },
        execute:function(command){
            var func = this.jm[command.action];
            var node = command.node;
            this.jm.enable_edit();
            func.apply(this.jm,command.data);
            this.jm.disable_edit();
            if(!!node){
                this.jm.select_node(node);
            }
        },
        add_command:function(command){
            this.commands.push(command);
            play();
        },
        get_command_list:function(){
            // deep clone
        },
        replay:function(){
            this.step = 0;
            this.play();
        },
        play:function(){
            this.jm_editable = this.jm.get_editable();
            this.jm.disable_edit();
            this.playing = true;
            this._play_stepbystep();
        },
        _play_stepbystep:function(){
            if(this.delay_handle != 0){
                $w.clearTimeout(this.delay_handle);
                this.delay_handle = 0;
            }
            if(this.step<this.commands.length){
                this.execute(this.commands[this.step]);
                this.step ++;
                var js = this;
                this.delay_handle = $w.setTimeout(function(){
                    js.play.call(js); 
                },options.play_delay);
            }else{
                this.play_end();
            }
        },
        play_end:function(){
            this.playing = false;
            if(this.jm_editable){
                this.jm.enable_edit();
            }else{
                this.jm.disable_edit();
            }
        }
    };
    var jm_event_handle = function(jm, type, data){
        if(type === 'init'){
            var js = new jsMind.shell(jm);
            jm.shell = js;
            js.init();
        }
        if(type === 'show'){
            var js = jm.shell;
            if(!!js){
                js.record('show',data);
            }
        }
        if(type === 'edit'){
            var js = jm.shell;
            if(!!js){
                var action=data.evt;
                delete data.evt;
                js.record(action,data);
            }
        }
    }
    jsMind.add_event_handle(jm_event_handle);
})(window);