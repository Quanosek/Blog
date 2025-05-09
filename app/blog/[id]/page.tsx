import Link from "next/link";

import DeleteComment from "@/components/deleteComment";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

import AddComment from "./addComment";
import DeletePost from "./deletePost";
import LoginButton from "./loginButton";

import pl from "date-and-time/locale/pl";
import date from "date-and-time";
date.locale(pl);

import styles from "@/styles/blog.module.scss";

export default async function PostPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const session = await auth();
  const user = session?.user as { id: string; username: string };

  const post = await db.posts.findUnique({ where: { id } });
  if (!post) {
    return (
      <main>
        <h1>Ten post nie istnieje {":("}</h1>
      </main>
    );
  }

  const pattern = date.compile("HH:mm, DD MMM YYYY r.");
  let formattedDate = date.format(post.createdAt, pattern);

  // If post was updated, display updated date
  if (post.createdAt.getTime() !== post.updatedAt.getTime()) {
    const updatedDate = date.format(post.updatedAt, pattern);
    formattedDate = formattedDate.concat(` (aktualizacja: ${updatedDate})`);
  }

  const authorView = post.author === user?.username;

  const comments = await db.comments.findMany({ where: { postId: post.id } });

  return (
    <main>
      <div className={styles.postLayout}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>{post.title}</h1>

          <p>
            {`@${post.author} • `}
            <span>{formattedDate}</span>
          </p>
          <hr />
        </div>

        <p className={styles.content}>{post.content}</p>

        {authorView && (
          <div className={styles.actionButtons}>
            <Link href={`/blog/${post.id}/edit`} className="button blue">
              <p>Edytuj treść</p>
            </Link>

            <DeletePost id={post.id} />
          </div>
        )}

        <div className={styles.commentsContainer}>
          <h2>Komentarze: ({comments.length})</h2>
          <hr />

          <div className={styles.commentsList}>
            {!comments.length && (
              <p className={styles.noComments}>Brak komentarzy</p>
            )}

            {comments.map((comment, i) => {
              const commentAuthor = comment.author === user?.username;

              return (
                <div key={i} id={comment.id}>
                  <div className={styles.comment}>
                    <h3>
                      {`@${comment.author} • `}
                      <span>{date.format(comment.createdAt, pattern)}</span>
                    </h3>
                    <p>{comment.text}</p>
                  </div>

                  {(authorView || commentAuthor) && (
                    <DeleteComment id={comment.id} />
                  )}
                </div>
              );
            })}
          </div>

          {user && <AddComment postId={post.id} author={user.username} />}
          {!user && <LoginButton postId={post.id} />}
        </div>
      </div>
    </main>
  );
}
