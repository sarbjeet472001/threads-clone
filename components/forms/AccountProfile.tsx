"use client"

import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
  } from "@/components/ui/form";
  import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {zodResolver} from "@hookform/resolvers/zod"
import { UserValidation } from "@/lib/validations/user";
import Image from "next/image";
import { z } from "zod"
import { ChangeEvent, useState } from "react";
import { usePathname,useRouter } from "next/navigation";
import { Textarea } from "../ui/textarea";
import { isBase64Image } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadThing";
import { updateUser } from "@/lib/actions/user.actions";


interface Props{
    user:{
        id:string;
        objectId:string;
        username:string;
        name:string;
        bio:string;
        image:string;
    };
    btnTitle:string;
}

const AccountProfile=({user,btnTitle}:Props)=>{
    const [files,setFiles]=useState<File[]>([]);
    const {startUpload}=useUploadThing("media");
    const router=useRouter();
    const pathname=usePathname();
    const form=useForm({
        resolver:zodResolver(UserValidation),
        defaultValues:{
            profile_photo:user?.image|| "",
            name: user?.name|| "",
            username:user?.username|| "",
            bio:user?.bio|| ""
        }
    })

    async function onSubmit(values: z.infer<typeof UserValidation>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
        const blob = values.profile_photo;

    const hasImageChanged = isBase64Image(blob);
    if (hasImageChanged) {
      const imgRes = await startUpload(files);

      if (imgRes && (imgRes[0]).url) {
        values.profile_photo = imgRes[0].url;
      }
    }

    await updateUser({
      name: values.name,
      path: pathname,
      username: values.username,
      userId: user.id,
      bio: values.bio,
      image: values.profile_photo,
    });

    if (pathname === "/profile/edit") {
      router.back();
    } else {
      router.push("/");
    }
  }

      const handleImage=(e:ChangeEvent,fieldChange:(value:string)=>void)=>{
        e.preventDefault();
        const fileReader = new FileReader();
        const target=e.target as HTMLInputElement;

    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      setFiles(Array.from(target.files));

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
      };

      fileReader.readAsDataURL(file);
    }
      }
    return (
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}
       className="flex flex-col justify-start gap-10">
        <FormField
          control={form.control}
          name="profile_photo"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel className="account-form_image-label">
                {field.value?(<Image src={field.value} alt="profile_photo"
                width={96} height={96} priority
                className="rounded-full object-contain"/>):(<Image src="/profile.svg" alt="profile_photo"
                width={24} height={24}
                className="object-contain"/>)}
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-200">
                <Input type="file" accept="image/*" 
                placeholder="Upload a photo" 
                className="account-form_image-input"
                onChange={(e)=>handleImage(e,field.onChange)}/>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Name
              </FormLabel>
              <FormControl >
                <Input 
                type="text"
                className="account-form_input no-focus"
                {...field}/>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Username
              </FormLabel>
              <FormControl>
                <Input 
                type="text"
                className="account-form_input no-focus"
                {...field}/>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Bio
              </FormLabel>
              <FormControl>
                <Textarea
                rows={10}
                className="account-form_input no-focus"
                {...field}/>
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-primary-500">Submit</Button>
      </form>
    </Form>
    )
}

export default AccountProfile;