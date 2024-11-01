import { ChatOllama } from "npm:@langchain/ollama";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  AIMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "npm:@langchain/core/prompts";
import { StringOutputParser } from "npm:@langchain/core/output_parsers";

//get dateTime now
const now = new Date();
now.setUTCFullYear(now.getUTCFullYear() - 18);



const ollama = new ChatOllama({
  model: "gemma2:9b",
  baseUrl: "http://gpu-vm.itss.local:8080/",
});

let system_message = "";

await Deno.readTextFile("prompt.txt").then((data) => {
  system_message = data + " Dựa vào thời gian tôi cung cấp để tính tuổi của Người tìm việc. Bạn phải kiểm tra bằng cách lấy năm hiện tại"  + now.getFullYear() + " - năm sinh xem có lớn hơn 18  không ?";
});

let scriptPrompt = SystemMessagePromptTemplate.fromTemplate(system_message);

let chatHistory = [scriptPrompt];

async function getUserInput(): Promise<string> {
  const buffer = new Uint8Array(1024);
  await Deno.stdout.write(new TextEncoder().encode("Nhập tin nhắn của bạn: "));
  const n = <number>await Deno.stdin.read(buffer);
  return new TextDecoder().decode(buffer.subarray(0, n)).trim();
}
// Hàm để lấy input từ người dùng

async function generate_response(history: any[]): Promise<string> {
  let chatTemplate = ChatPromptTemplate.fromMessages(history);
  let chain = chatTemplate.pipe(ollama).pipe(new StringOutputParser());

  const response = await chain.invoke({});

  console.log(response);
  return response;
}

while (true) {
  const userInput = await getUserInput();
  const humanMessage = HumanMessagePromptTemplate.fromTemplate(userInput);
  chatHistory.push(humanMessage);
  const response = await generate_response(chatHistory);
  const aiMessage = AIMessagePromptTemplate.fromTemplate(response);
  chatHistory.push(aiMessage);
}
