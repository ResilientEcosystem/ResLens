//@ts-nocheck
import "@pyroscope/flamegraph/dist/index.css";

import { useContext, useEffect } from "react";
import { useState } from "react";
import { FlamegraphRenderer } from "@pyroscope/flamegraph";
import { ProfileData1 } from "@/static/testFlamegraph";
import { Button } from "../ui/button";
import { ViewTypes } from "@pyroscope/flamegraph/dist/packages/pyroscope-flamegraph/src/FlameGraph/FlameGraphComponent/viewTypes";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FlamegraphRendererProps } from "@pyroscope/flamegraph/dist/packages/pyroscope-flamegraph/src/FlamegraphRenderer";
import { middlewareApi } from "@/lib/api";
import { Download, RefreshCcw, Flame, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "../ui/loader";
import { NotFound } from "../ui/not-found";
import { ModeContext } from "@/hooks/context";
import { ModeType } from "../toggle";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

interface FlamegraphCardProps {
  from: string | number;
  until: string | number;
}
export const Flamegraph = (props: FlamegraphCardProps) => {
  const { toast } = useToast();
  /**
   * UI Client Data
   */

  const mode = useContext<ModeType>(ModeContext);
  const [clientName, setClientName] = useState("cpp_client_1");
  const [profilingData, setProfilingData] = useState(ProfileData1);

  function handleClientNameChange(value: string) {
    setClientName(value);
  }

  /**
   * UI Client State
   */
  const [flamegraphDisplayType, setFlamegraphDisplayType] =
    useState<ViewTypes>("both");
  const [flamegraphInterval, setFlamegraphInterval] =
    useState<string>("now-5m");
  const [_, setSearchQueryToggle] = useState(true); //dummy dispatch not used functionally
  const [refresh, setRefresh] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setSearchQuery] = useState<
    FlamegraphRendererProps["sharedQuery"]
  >({
    searchQuery: "",
    onQueryChange: (value: any) => {},
    syncEnabled: true,
    toggleSync: setSearchQueryToggle,
  });

  function handleFlamegraphTypeChange(value: string) {
    setFlamegraphDisplayType(value);
  }

  function handleFlamegraphIntervalChange(value: string) {
    setFlamegraphInterval(value);
  }

  function handleDownload() {
    const jsonData = JSON.stringify(profilingData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function refreshFlamegraph() {
    setRefresh((prev) => !prev);
  }

  useEffect(() => {
    if (mode === "offline") {
      setProfilingData(ProfileData1);
      toast({
        title: "Offline Mode",
        description: "Using sample data in offline mode.",
        variant: "default",
      });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        let from: string | number = flamegraphInterval;
        let until: string | number = "now";
        if (props.from && props.until) {
          from = props.from;
          until = props.until;
        }
        const response = await middlewareApi.post("/pyroscope/getProfile", {
          query: clientName,
          from: from,
          until: until,
        });
        if (response?.data?.error) {
          setError(response?.data?.error);
          toast({
            title: "Error",
            description: response?.data?.error,
            variant: "destructive",
          });
          setError(response?.data?.error);
        } else {
          setProfilingData(response?.data);
          toast({
            title: "Data Updated",
            description: `Flamegraph data updated for ${clientName}`,
            variant: "default",
          });
        }
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setError(error?.message);
      }
    };
    fetchData();
  }, [clientName, refresh, props.from, props.until, mode, flamegraphInterval]);
  return (
    <Card className="w-full max-w-8xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-xl">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-blue-400" />
            <CardTitle className="text-2xl font-bold">Flamegraph</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={refreshFlamegraph}>
              <RefreshCcw />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-colors duration-200 ease-in-out rounded">
                    <Info size={18.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click for more information about these metrics</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {error ? (
          <NotFound onRefresh={refreshFlamegraph} />
        ) : (
          <>
            <div className="flex justify-between mb-4">
              <div className="flex flex-row space-x-2">
                <Input
                  placeholder="Filter by function name"
                  onChange={(e) =>
                    setSearchQuery((prev) => {
                      return {
                        ...prev,
                        searchQuery: e.target.value,
                      };
                    })
                  }
                  className="w-64 bg-slate-800 border-slate-700"
                />
              </div>
              <div className="flex flex-row space-x-2">
                <Button variant="outline" size="icon" onClick={handleDownload}>
                  <Download />
                </Button>

                <Select onValueChange={handleClientNameChange}>
                  <SelectTrigger className="w-[120px] h-[30px]">
                    <SelectValue placeholder="App Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpp_client_1">
                      Current Primary (P)
                    </SelectItem>{" "}
                    {/* TODO: remove static coding */}
                    <SelectItem value="cpp_client_2">
                      Secondary-1
                    </SelectItem>{" "}
                    {/* TODO: remove static coding */}
                    <SelectItem value="system">Host</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={handleFlamegraphTypeChange}>
                  <SelectTrigger className="w-[120px] h-[30px]">
                    <SelectValue placeholder="Graph Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="flamegraph">Flamegraph</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="sandwich">Sandwich</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={handleFlamegraphIntervalChange}>
                  <SelectTrigger className="w-[120px] h-[30px]">
                    <SelectValue placeholder="Interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now-5m">Last 5 minutes</SelectItem>
                    <SelectItem value="now-30m">Last 30 minutes</SelectItem>
                    <SelectItem value="now-1h">Last 1 hour</SelectItem>
                    <SelectItem value="now-12h">Last 12 hours</SelectItem>
                    <SelectItem value="now-24h">Last 24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex-1 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
              {loading ? (
                <Loader className="h-[800px] p-4" />
              ) : (
                <FlamegraphRenderer
                  key={flamegraphDisplayType} // Force a re-render when the type changes
                  profile={profilingData}
                  showCredit={false}
                  panesOrientation="horizontal"
                  onlyDisplay={flamegraphDisplayType}
                  showToolbar={true}
                  colorMode="dark"
                  sharedQuery={query}
                />
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
