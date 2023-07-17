import Loader from "@koishijs/loader";
import path from "node:path";

export default async () => {
  let loader = new Loader()
  await loader.init(process.env.KOISHI_CONFIG_FILE || path.resolve(__dirname, './koishi.json'))
  const config = await loader.readConfig()
  const app = await loader.createApp();
  await app.start()
}
