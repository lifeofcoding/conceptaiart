import { type NextPage } from "next";
import Page from "@components/Page";
import ResultsWindow from "@components/ResultsWindow";
import { GenerateSchema, GenerateSchemaType } from "@schemas/Generate";
import { api } from "~/utils/api";
import { ChangeEvent, useState, useEffect } from "react";
// import { SubmitHandler, useForm } from "react-hook-form";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagesResponseDataInner } from "openai";
import { useSession, signIn } from "next-auth/react";

const Generate: NextPage = () => {
  const { data: sessionData } = useSession();
  const [images, setImages] = useState<ImagesResponseDataInner[]>([]);
  const { mutate, isLoading } = api.generator.generate.useMutation({
    onSuccess(data) {
      setImages(data.images);
      localStorage.setItem("prompt", "");
    },
    onError(error, variables, context) {
      debugger;
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(GenerateSchema),
  });

  useEffect(() => {
    const preloadPrompt = localStorage.getItem("prompt");
    if (preloadPrompt) {
      setValue("prompt", preloadPrompt);
    }
  }, []);

  const convertBase64 = (file?: File) => {
    return new Promise<String | ArrayBuffer | null>((resolve, reject) => {
      if (!file) return reject(null);
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const onSelectFile = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files ? e.target.files[0] : undefined;
    const base64 = await convertBase64(file);
    setValue("file", base64);
  };

  const onFocus = () => {
    setValue("prompt", localStorage.getItem("prompt") || "");
  };

  //   const onSubmit: SubmitHandler<GenerateSchemaType> = async (data) => {
  //     mutate(data);
  //   };

  return (
    <Page title="Generate">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <div className="min-h-screen w-full rounded bg-black/50 p-5 text-white">
          <h1 className="pageTitle">Generate Concept</h1>

          <div className="flex w-full flex-col items-center justify-center">
            <div className="mt-2 mb-2 flex aspect-square w-full items-center justify-center rounded border border-white p-2 md:w-3/5">
              <ResultsWindow image={images[0]?.url} isLoading={isLoading} />
            </div>

            <div className="flex w-full flex-col  rounded bg-slate-600 p-2 md:w-3/4">
              <form
                onSubmit={handleSubmit((d) => {
                  if (!sessionData) {
                    localStorage.setItem("prompt", d.prompt);

                    return signIn("google", {
                      callbackUrl: "/generate",
                    });
                  }
                  return mutate(d as GenerateSchemaType);
                })}
              >
                {errors.prompt?.message && (
                  <div className="mb-2 w-full rounded bg-black p-1">
                    {errors.prompt?.message as string}
                  </div>
                )}

                <div className="mb-2 flex w-full flex-col md:flex-row">
                  <div className="mr-2 w-2/12">
                    <label>Prompt:</label>
                  </div>
                  <div className="w-full">
                    <textarea
                      className="h-20 w-full rounded bg-slate-400"
                      {...register("prompt")}
                      onFocus={onFocus}
                    ></textarea>
                  </div>
                </div>

                <div className="mb-2 flex w-full flex-col md:flex-row">
                  <div className="mr-2 w-2/12">
                    <label>Upload Image:</label>
                  </div>
                  <div className="w-full">
                    <input type="file" name="file" onChange={onSelectFile} />
                    <input type="hidden" {...register("file")} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    className="rounded bg-black p-2 disabled:bg-slate-600"
                    disabled={isLoading}
                    type="submit"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default Generate;
