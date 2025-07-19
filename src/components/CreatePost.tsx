import { useState, type ChangeEvent } from "react";
import { supabase } from "../supabase-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { fetchCommunities, type Community } from "./CommunityList";

interface PostInput {
  title: string;
  content: string;
  avatar_url: string | null;
  community_id?: null | number;
}

const createPost = async (post: PostInput, imageFile: File) => {
  const filePath = `${post.title}-${Date.now()}-${imageFile.name}`;

  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(filePath, imageFile);

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicURLData } = supabase.storage
    .from("post-images")
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from("posts")
    .insert({ ...post, image_url: publicURLData.publicUrl });

  if (error) throw new Error(error.message);

  return data;
};

export const CreatePost = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [comunityId, setComunityId] = useState<number | null>()
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { user } = useAuth();

  const { data: communities } = useQuery<Community[], Error>({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data: { post: PostInput; imageFile: File }) => {
      return createPost(data.post, data.imageFile);
    },
  });
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); 
    if (!selectedFile) throw new Error("seleeciones una image valida");
    mutate({
      post: {
        title,
        content,
        avatar_url: user?.user_metadata.avatar_url || null,
        community_id: comunityId
      },
      imageFile: selectedFile,
    });
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCommunityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setComunityId(value ? Number(value) : null);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div>
        <label htmlFor="title" className="block mb-3 font-medium">
          Title
        </label>
        <input
          type="text"
          id="title"
          required
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-white/10 bg-transparent p-2 rounded"
        />
      </div>
      <div>
        <label htmlFor="content" className="block mb-2 font-medium">
          Content
        </label>
        <textarea
          id="content"
          required
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-white/10 bg-transparent p-2 rounded"
        ></textarea>
      </div>

      <div>
        <label>Select Community</label>
        <select id="community" onChange={handleCommunityChange}>
          <option value={""}>-- Choose one --</option>
          {communities?.map((community, key) => (
            <option key={key} value={community.id}>
              {community.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="image" className="block mb-2 font-medium">
          Upload Image
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          required
          onChange={handleFileChange}
          className="w-full text-gray-200"
        />
      </div>
      <button
        type="submit"
        className="bg-purple-500 text-white px-4 py-2 rounded cursor-pointer"
      >
        {isPending ? "Creating..." : "Create Post"}
      </button>
      {isError && <p className="text-red-500">Error creatig post</p>}
    </form>
  );
};
