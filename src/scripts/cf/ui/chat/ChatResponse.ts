/// <reference path="../BasicElement.ts"/>
/// <reference path="../../logic/Helpers.ts"/>
/// <reference path="../../ConversationalForm.ts"/>

// namespace
namespace cf {
	// interface
	export interface IChatResponseOptions{
		response: string;
		image: string;
		isRobotReponse: boolean;
		tag: ITag;
	}

	export const ChatResponseEvents = {
		ROBOT_QUESTION_ASKED: "cf-on-robot-asked-question"
	}

	// class
	export class ChatResponse extends BasicElement {
		private response: string;
		private image: string;
		private isRobotReponse: boolean;
		private tag: ITag

		public set visible(value: boolean){
			if(value){
				this.el.classList.add("show");
			}else{
				this.el.classList.remove("show");
			}
		}

		constructor(options: IChatResponseOptions){
			super(options);
			this.tag = options.tag;
		}

		public setValue(dto: FlowDTO = null){
			this.response = dto ? dto.text : "";

			this.processResponse();
			
			const text: Element = this.el.getElementsByTagName("text")[0];

			if(!this.visible){
				this.visible = true;
			}

			if(!this.response || this.response.length == 0){
				text.setAttribute("thinking", "");
			}else{
				text.innerHTML = this.response;
				text.setAttribute("value-added", "");
				text.removeAttribute("thinking");

				// check for if reponse type is file upload...
				if(dto && dto.controlElements && dto.controlElements[0]){
					switch(dto.controlElements[0].type){
						case "UploadFileUI" :
							text.classList.add("file-icon");
							var icon = document.createElement("span");
							icon.innerHTML = Dictionary.get("icon-type-file");
							text.insertBefore(icon.children[0], text.firstChild)
							break;
					}
				}

				if(this.isRobotReponse){
					// Robot Reponse ready to ask question.

					ConversationalForm.illustrateFlow(this, "dispatch", ChatResponseEvents.ROBOT_QUESTION_ASKED, this.response);
					document.dispatchEvent(new CustomEvent(ChatResponseEvents.ROBOT_QUESTION_ASKED, {
						detail: this
					}));
				}
			}
		}

		private processResponse(){
			this.response = Helpers.emojify(this.response);
			
			if(this.tag && this.tag.type == "password" && !this.isRobotReponse){
				var newStr: string = "";
				for (let i = 0; i < this.response.length; i++) {
					newStr += "*";
				}
				this.response = newStr;
			}
		}

		protected setData(options: IChatResponseOptions):void{
			this.image = options.image;
			this.response = "";
			this.isRobotReponse = options.isRobotReponse;
			super.setData(options);

			setTimeout(() => {
				this.setValue();

				if(this.isRobotReponse){
					// Robot is pseudo thinking
					setTimeout(() => this.setValue(<FlowDTO>{text: options.response}), 0);//ConversationalForm.animationsEnabled ? Helpers.lerp(Math.random(), 500, 900) : 0);
				}else{
					// show the 3 dots automatically
					setTimeout(() => this.el.classList.add("peak-thumb"), ConversationalForm.animationsEnabled ? 1400 : 0);
				}
			}, 0);
		}

		// template, can be overwritten ...
		public getTemplate () : string {
			return `<cf-chat-response class="` + (this.isRobotReponse ? "robot" : "user") + `">
				<thumb style="background-image: url(` + this.image + `)"></thumb>
				<text>` + (!this.response ? "<thinking><span>.</span><span>.</span><span>.</span></thinking>" : this.response) + `</text>
			</cf-chat-response>`;
		}
	}
}