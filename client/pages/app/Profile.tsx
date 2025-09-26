import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user, refresh, logout } = useAuth();

  return (
    <div className="grid gap-4">
      <div className="text-2xl font-semibold">Profile</div>

      <Card>
        <CardContent className="p-5 grid gap-2 text-sm">
          {user ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground">Name</div>
                <div className="col-span-2 font-medium">{user.name}</div>
                <div className="text-muted-foreground">Email</div>
                <div className="col-span-2 font-medium">
                  {user.email || "—"}
                </div>
                <div className="text-muted-foreground">Phone</div>
                <div className="col-span-2 font-medium">
                  {user.phone || "—"}
                </div>
                <div className="text-muted-foreground">Roles</div>
                <div className="col-span-2 font-medium">
                  {user.roles?.join(", ")}
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-3">
                <Button variant="outline" onClick={refresh}>
                  Refresh
                </Button>
                <Button onClick={logout}>Logout</Button>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">You are not logged in.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
