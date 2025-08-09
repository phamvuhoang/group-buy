import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthWidget from "@/components/AuthWidget";

export default function AuthTestPage() {
  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Test both OTP and Magic Link authentication methods.
          </p>
          <AuthWidget />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>
            <strong>Enter Code Method:</strong>
            <ol className="list-decimal list-inside ml-2 space-y-1">
              <li>Select "Enter Code" tab</li>
              <li>Enter your email</li>
              <li>Click "Send OTP"</li>
              <li>Check email for 6-digit code</li>
              <li>Enter code and click "Verify"</li>
            </ol>
          </div>

          <div>
            <strong>Click Link Method:</strong>
            <ol className="list-decimal list-inside ml-2 space-y-1">
              <li>Select "Click Link" tab</li>
              <li>Enter your email</li>
              <li>Click "Send Link"</li>
              <li>Check email and click the link</li>
              <li>You'll be redirected back automatically</li>
            </ol>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <strong>Note:</strong> Both methods will send you an email with a 6-digit code. The difference is:
            <ul className="list-disc list-inside ml-2 mt-1">
              <li><strong>Enter Code:</strong> You manually type the code into the form</li>
              <li><strong>Click Link:</strong> You click the link in the email to sign in automatically</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
